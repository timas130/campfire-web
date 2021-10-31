import Document, {Head, Html, Main, NextScript} from "next/document";

class MyDocument extends Document {
  render() {
    // noinspection HtmlRequiredTitleElement
    return <Html lang="ru">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="search" type="application/opensearchdescription+xml"
              title="Поиск Campfire" href="/opensearch.xml" />
        <meta name="theme-color" content="#FFFFFF" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <div id="modal-root" />
      </body>
    </Html>;
  }
}

export default MyDocument;
