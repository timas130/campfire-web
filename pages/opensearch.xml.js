export default function OpenSearch() {
  return null;
}

export async function getServerSideProps({res}) {
  const siteUrl = process.env.siteUrl;
  const xml = `<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                       xmlns:moz="http://www.mozilla.org/2006/browser/search/">
    <ShortName>Поиск Bonfire</ShortName>
    <Description>Bonfire</Description>
    <InputEncoding>UTF-8</InputEncoding>
    <Image width="256" height="256" type="image/x-icon">${siteUrl}/favicon.ico</Image>
    <Url type="text/html" template="${siteUrl}/post/search">
        <Param name="q" value="{searchTerms}" />
    </Url>
    <moz:SearchForm>${siteUrl}/post/search</moz:SearchForm>
</OpenSearchDescription>
`;
  res.setHeader("Content-Type", "application/opensearchdescription+xml");
  res.write(xml);
  res.end();
  return {props: {}};
}
