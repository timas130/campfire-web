import TextPage from "./TextPage";
import ImagePage from "./ImagePage";
import LinkPage from "./LinkPage";
import QuotePage from "./QuotePage";
import React from "react";

const pageTypes = {
  1: TextPage,
  2: ImagePage,
  4: LinkPage,
  5: QuotePage
};
const pageTypesNames = {
  1: "PAGE_TYPE_TEXT",
  2: "PAGE_TYPE_IMAGE",
  3: "PAGE_TYPE_IMAGES",
  4: "PAGE_TYPE_LINK",
  5: "PAGE_TYPE_QUOTE",
  6: "PAGE_TYPE_SPOILER",
  7: "PAGE_TYPE_POLLING",
  9: "PAGE_TYPE_VIDEO",
  10: "PAGE_TYPE_TABLE",
  11: "PAGE_TYPE_DOWNLOAD",
  12: "PAGE_TYPE_CAMPFIRE_OBJECT",
  13: "PAGE_TYPE_USER_ACTIVITY",
  14: "PAGE_TYPE_LINK_IMAGE",
};

export function Page(props) {
  const {page} = props;
  if (! pageTypes[page.J_PAGE_TYPE]) {
    return <TextPage page={{
      J_TEXT:
        "Oops, unimplemented! Page type: [noFormat]" +
          (pageTypesNames[page.J_PAGE_TYPE] || "unknown") +
        "[/noFormat]"
    }} />;
  } else {
    return React.createElement(pageTypes[page.J_PAGE_TYPE], {page});
  }
}

export function TestPages() {
  return <>
    <TextPage page={{
      J_TEXT: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad consequatur culpa dolorem eaque earum esse eum hic in itaque magnam nisi porro provident qui reprehenderit, sapiente, soluta voluptas voluptate voluptatem?",
      J_SIZE: 0,
      align: 0,
      icon: 1
    }} />
    <TextPage page={{
      J_TEXT: "Lorem ipsum dolor sit amet",
      J_SIZE: 1,
      align: 1,
      icon: 1
    }} />
    <TextPage page={{
      J_TEXT: "Lorem ipsum dolor sit amet",
      J_SIZE: 1,
      align: 2,
      icon: 7
    }} />
    <LinkPage page={{
      name: "Interesting link",
      link: "https://www.google.com/search?q=hey&newwindow=1&source=hp&ei=eyVTYdD6Dsica-WtosAH&iflsig=ALs-wAMAAAAAYVMzi7o7YnHIQQOyhJNq9mwHgzw7gsMo&oq=hey&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMgUIABCABDIICC4QgAQQsQMyEQguEIAEELEDEIMBEMcBENEDMgsILhCABBDHARCvATIFCAAQgAQyCAgAEIAEELEDMg4ILhCABBCxAxDHARDRAzIFCAAQgAQyDgguEIAEELEDEMcBEKMCUMUEWJgGYPwGaABwAHgAgAGnAYgBlwKSAQMwLjKYAQCgAQE&sclient=gws-wiz&ved=0ahUKEwiQpK-176HzAhVIzhoKHeWWCHgQ4dUDCAY&uact=5"
    }} />
    <QuotePage page={{
      author: "Lev Tolstoy",
      text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad consequatur culpa dolorem eaque earum esse eum hic in itaque magnam nisi porro provident qui reprehenderit, sapiente, soluta voluptas voluptate voluptatem?"
    }} />
    <ImagePage page={{
      J_IMAGE_ID: 1,
      J_W: 100,
      J_H: 100
    }} />
  </>;
}
