// for compatibility with https://sayzen.ru/r/r.php

import {getStaticProps} from "./[link]";

export default function Redirect() {
  // unreachable
  return null;
}

export async function getServerSideProps(ctx) {
  return await getStaticProps({
    params: {link: ctx.query.a},
  });
}
