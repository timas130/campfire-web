import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";
import sharp from "sharp";

const imageConsts = {
  page: {
    side: 1500,
    sideGif: 400,
    weight: 1024 * 128,
    weightGif: 1024 * 1024 * 6,
  },
  pageMultipleLarge: {
    side: 1980,
    sideGif: 164,
    weight: 1024 * 128,
    weightGif: 1024 * 512,
  },
  pageMultipleMini: {
    side: 500,
    weight: 1024 * 16,
  },
};

function compressImage(inp, side, q = 70) {
  const image = sharp(inp);
  return image
    .metadata()
    .then(meta => {
      return image
        .resize({
          width: meta.width >= meta.height ? side : undefined,
          height: meta.height > meta.width ? side : undefined,
          withoutEnlargement: true,
        })
        .jpeg({ mozjpeg: true, quality: q })
        .toBuffer();
    });
}

async function transformPages(pages) {
  const dataOutput = [];
  const resultPages = pages
    .map(page => {
      if (page.J_PAGE_TYPE === 2 && typeof page._cweb_image === "string") { // image
        const imageBlob = Buffer.from(page._cweb_image, "base64");
        page._cweb_image = undefined;

        dataOutput.push((async () => {
          let q = 70, compressedImage;
          do {
            compressedImage = compressImage(imageBlob, imageConsts.page.side, q);
            q -= 10;
          } while (compressedImage.byteLength > imageConsts.page.weight && q >= 10);

          if (compressedImage.byteLength > imageConsts.page.weight) {
            throw {
              code: "E_BAD_PAGE",
              messageError: "The image could not be compressed enough",
              params: [compressedImage.byteLength, imageConsts.page.weight],
              cweb: true,
            };
          }

          return compressedImage;
        })());
        dataOutput.push((async () => null)()); // TODO: gifs
      }
      return page;
    });
  return {resultPages, dataOutput: await Promise.all(dataOutput)};
}

export async function pageAction(req, res, draftId, action, args) {
  let transformed;
  switch (action) {
    case "put":
      transformed = await transformPages(args.pages);
      return (await sendRequestAuthenticated(
        req, res, "RPostPutPage", {
          unitId: draftId,
          appKey: "",
          appSubKey: "",
          ...args, // fandomId, languageId
          pages: transformed.resultPages,
        }, transformed.dataOutput,
      )).J_RESPONSE;
    case "remove":
      return (await sendRequestAuthenticated(
        req, res, "RPostRemovePage", {
          unitId: draftId,
          ...args, // pageIndexes
        },
      )).J_RESPONSE;
    case "move":
      return (await sendRequestAuthenticated(
        req, res, "RPostMovePage", {
          unitId: draftId,
          ...args, // pageIndex, targetIndex
        },
      )).J_RESPONSE;
    case "change":
      transformed = await transformPages([args.page]);
      return (await sendRequestAuthenticated(
        req, res, "RPostChangePage", {
          unitId: draftId,
          ...args, // pageIndex
          page: transformed.resultPages[0],
        }, transformed.dataOutput,
      )).J_RESPONSE.page;
    default:
      throw {code: "INVALID_ACTION", messageError: "", params: [], cweb: true};
  }
}

export default async function pageHandler(req, res) {
  try {
    res.send(await pageAction(req, res, req.query.id, req.query.action, req.body));
  } catch (e) {
    console.error(e);
    sendErrorIfFromRemote(res, e);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
