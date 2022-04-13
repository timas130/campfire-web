export default function MetaTags({title, url, description = "", image = "", type = "website"}) {
  return <>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />

    <meta property="og:type" content={type} />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
    {image && <meta property="og:image" content={image} />}

    <meta property="twitter:card" content="summary" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={title} />
    {description && <meta property="twitter:description" content={description} />}
    {image && <meta property="twitter:image" content={image} />}
  </>;
}
