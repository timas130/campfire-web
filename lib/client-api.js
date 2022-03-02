import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {useInView} from "react-intersection-observer";
import {useEffect, useState} from "react";
import {setUser} from "@sentry/nextjs";
import {useRouter} from "next/router";

export const fetcher = (...args) => fetch(...args)
  .then(res => res.json())
  .then(res => {
    if (res.error) throw res.response;
    else return res;
  });

export const useUser = () => useSWRUser().data;
export const useSWRUser = () =>
  useSWR("/api/user", (...args) => fetcher(...args).then(resp => {
    if (resp && resp.J_ID) setUser({
      id: resp.J_ID,
      username: resp.J_NAME,
      ip_address: resp.ip,
    });
    return resp;
  }), {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
export const useRequiredUser = () => {
  const {data: user, isValidating: isValidatingUser} = useSWRUser();
  const router = useRouter();
  useEffect(() => {
    if (!user && router && !isValidatingUser) {
      router.push("/auth/login");
    }
  }, [isValidatingUser, router, user]);
  if (!user || !router) return null;

  return user;
};

/**
 * Returns if user is online.
 * @param {{J_LAST_ONLINE_DATE: number}} account account
 * @return {boolean} is the account online
 */
export const isOnline = (account) =>
  account.J_LAST_ONLINE_DATE > Date.now() - 1000 * 60 * 15;

export const useInfScroll = (url, dateBased = false, perPage = 20, fallbackData = []) => {
  const {data, size, setSize, isValidating} = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (! previousPageData) return url;

      if (previousPageData.units) previousPageData = previousPageData.units;
      if (previousPageData.posts) previousPageData = previousPageData.posts;
      if (previousPageData.length === 0) return null;
      else return url + (url.includes("?") ? "&" : "?") + "offset=" + (
        dateBased ?
          previousPageData[previousPageData.length - 1].dateCreate :
          perPage * pageIndex
      );
    }, fetcher, {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateFirstPage: false,
      fallbackData,
    },
  );
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      // noinspection JSIgnoredPromiseFromCall
      !isValidating && setSize(size + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  useEffect(() => setSize(1), [setSize]);

  let lastPageLength;
  if ((data || []).length > 0) {
    let lastPage = data[data.length - 1];
    if (lastPage.units) lastPage = lastPage.units;
    if (lastPage.posts) lastPage = lastPage.posts;
    lastPageLength = lastPage.length;
  }
  return {
    data, ref, loadMore: () => !isValidating && setSize(size + 1),
    showLoader: (data || []).length === 0 || lastPageLength !== 0,
  };
};

export const useInterval = (handler, interval, deps = []) => {
  useEffect(() => {
    const id = setInterval(handler, interval);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * Not really swr, but rather a simplified version to
 * make possible mutating the response locally.
 * @param {string} url
 * @returns {{data: any, setData: ((value: any | ((any) => any)) => void)}}
 */
export const useLocalMutSWR = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!url) return;
    fetcher(url).then(resp => setData(resp));
  }, [url]);
  return {data, setData};
};
