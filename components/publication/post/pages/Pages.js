// Don't even try to understand what my shitcode does.
// Even I can't. Everything I know is that works.
//
// stolen from campweb lol. it doesn't count though, it
// was still mine.

import {Page} from "./Page";

function spoilersNest(pages, start, len) {
  let result = [];
  let i = start;
  while (i < start + Math.min(len || pages.length, pages.length - start)) {
    if (pages[i]["J_PAGE_TYPE"] === 6) { // spoiler
      let spoilerContent = spoilersNest(pages, i + 1, pages[i].count);
      spoilerContent[0].name = pages[i].name;
      spoilerContent[0].count = pages[i].count;
      spoilerContent[0].J_PAGE_TYPE = 6; // spoiler
      result.push(spoilerContent[0]);
      i += spoilerContent[1] + 1;
      len += spoilerContent[1];
    } else {
      result.push(pages[i]);
      i++;
    }
  }
  return [result, i - start];
}

function nestToElements(nested, PageEl = Page, additional) {
  let length = 0;
  return [nested.map((page, idx) => {
    if (page.J_PAGE_TYPE === 6) { // spoiler
      const els = nestToElements(page, PageEl, additional);
      length += els[1] + 1;
      return <PageEl page={page} idx={idx} key={idx} additional={additional}>
        {els[0]}
      </PageEl>;
    } else {
      length++;
      return <PageEl page={page} idx={idx} key={idx} additional={additional} />;
    }
  }), length];
}

export default function Pages({ pages, pageEl: PageEl = Page, additional }) {
  if (PageEl !== Page) {
    return pages.map((page, idx) => <PageEl page={page} idx={idx} key={idx} additional={additional} />);
  } else {
    return nestToElements(spoilersNest(pages, 0)[0], PageEl, additional)[0];
  }
}
