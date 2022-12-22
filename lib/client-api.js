import useSWR, {mutate as globalMutate} from "swr";
import useSWRInfinite from "swr/infinite";
import {useInView} from "react-intersection-observer";
import {useEffect, useMemo, useState} from "react";
// import {setUser} from "@sentry/nextjs";
import {useRouter} from "next/router";
import {authStatePromise, fbAuth} from "./firebase";

export const fetcher = async (...args) => {
  await authStatePromise;

  if (fbAuth.currentUser) {
    if (!args[1]) args[1] = {};
    if (!args[1].headers) args[1].headers = {};
    args[1].headers["x-cf-login-token"] = "Email2 - " + (await fbAuth.currentUser.getIdToken(false));
  }

  return fetch(...args)
    .then(res => res.json())
    .then(res => {
      if (res?.error) throw res.response;
      else return res;
    });
};

export const useUser = () => useSWRUser().data;
export const useSWRUser = () =>
  useSWR("/api/user", (...args) => fetcher(...args).then(resp => {
    // if (resp && resp.J_ID) setUser({
    //   id: resp.J_ID,
    //   username: resp.J_NAME,
    //   ip_address: resp.ip,
    // });
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

export const createInfKey = (url, dateBased = false, perPage = 20) => (pageIndex, previousPageData) => {
  if (! previousPageData) return url;

  if (previousPageData.units) previousPageData = previousPageData.units;
  if (previousPageData.posts) previousPageData = previousPageData.posts;
  if (previousPageData.length === 0) {
    return null;
  } else {
    return url + (url.includes("?") ? "&" : "?") + "offset=" + (
      dateBased ?
        (
          previousPageData[previousPageData.length - 1].dateCreate ||
          previousPageData[previousPageData.length - 1].J_N_DATE_CREATE
        ) :
        perPage * pageIndex
    );
  }
};

export const useInfScroll = (url, dateBased = false, perPage = 20, fallbackData = []) => {
  const key = useMemo(() => createInfKey(url, dateBased, perPage), [url, dateBased, perPage]);
  const {data, size, setSize, isValidating, mutate} = useSWRInfinite(
    key, fetcher, {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      fallbackData,
    }
  );
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
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
    data, ref, loadMore: () => !isValidating && setSize(size + 1),
    showLoader: (data || []).length === 0 || lastPageLength !== 0,
    setSize, mutate,
  };
};

export const infMutate = (mutate, url, dateBased = false, perPage = 20, mutator) => {
  return (mutate || globalMutate)(mutator);
};

export const infMutateFlatMap = (mutate, url, mapper, dateBased = false, perPage = 20) => {
  return infMutate(mutate, url, dateBased, perPage, async dataL => {
    const data = dataL.flat(1).flatMap(mapper);
    const result = unflat(data, perPage);
    console.log("before", dataL);
    console.log("after", result);
    return result;
  });
};
export const infIdMutate = (mutate, url, id, changeTo, dateBased = false, perPage = 20) => {
  return infMutateFlatMap(mutate, url, a => {
    if (a.id === id) return changeTo !== undefined ? [changeTo] : [];
    else return [a];
  }, dateBased, perPage);
};
export const infPush = (mutate, url, el, dateBased = false, perPage = 20) => {
  return infMutate(mutate, url, dateBased, perPage, async dataL => {
    const data = dataL.flat(1);
    data.push(el);
    return unflat(data, perPage);
  });
};

function unflat(array, every) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (i % every === 0) result.push([]);
    result[result.length - 1].push(array[i]);
  }
  return result;
}

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

export function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result.substr(reader.result.indexOf(",") + 1));
    };
  });
}
