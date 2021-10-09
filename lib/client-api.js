export const fetcher = (...args) => fetch(...args)
  .then(res => res.json())
  .then(res => {
    if (res.error) throw res.response;
    else return res;
  });
