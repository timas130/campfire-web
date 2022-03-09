export default function MetaTags({title, url, description = "", image = "https://campfire.moe/social-poster.png"}) {
  return <>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />
  </>;
}
