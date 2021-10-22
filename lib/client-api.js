import useSWRImmutable from "swr/immutable";
import useSWRInfinite from "swr/infinite";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";

export const fetcher = (...args) => fetch(...args)
  .then(res => res.json())
  .then(res => {
    if (res.error) throw res.response;
    else return res;
  });

export const useUser = () =>
  useSWRImmutable("/api/user", fetcher, {
    shouldRetryOnError: false,
  }).data;

/**
 * Returns if user is online.
 * @param {{J_LAST_ONLINE_DATE: number}} account account
 * @return {boolean} is the account online
 */
export const isOnline = (account) =>
  account.J_LAST_ONLINE_DATE > Date.now() - 1000 * 60 * 15;

export const useInfScroll = (url, dateBased = false, perPage = 20, fallbackData = []) => {
  const {data, size, setSize} = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (! previousPageData) return url;

      if (previousPageData.units) previousPageData = previousPageData.units;
      if (previousPageData.posts) previousPageData = previousPageData.posts;
      if (previousPageData.length === 0) return null;
      else return url + "?offset=" + (
        dateBased ?
          previousPageData[previousPageData.length - 1].dateCreate :
          perPage * pageIndex
      );
    }, fetcher, {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateFirstPage: false,
      fallbackData
    },
  );
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      // noinspection JSIgnoredPromiseFromCall
      setSize(size + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  let lastPageLength;
  if ((data || []).length > 0) {
    let lastPage = data[data.length - 1];
    if (lastPage.units) lastPage = lastPage.units;
    if (lastPage.posts) lastPage = lastPage.posts;
    lastPageLength = lastPage.length;
  }
  return {
    data, ref,
    showLoader: (data || []).length === 0 || lastPageLength !== 0
  };
};

export const useInterval = (handler, interval, deps = []) => {
  useEffect(() => {
    const id = setInterval(handler, interval);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
