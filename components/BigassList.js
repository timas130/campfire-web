import {useRef} from "react";
import {useVirtual} from "react-virtual";

export default function BigassList({list}) {
  if (typeof window === "undefined") return <div>{list}</div>;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const parentRef = useRef(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rowVirtualizer = useVirtual({
    size: list.length,
    parentRef, overscan: 1,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    windowRef: useRef(window),
  });

  return <div ref={parentRef}><div
    style={{
      height: rowVirtualizer.totalSize,
      width: "100%",
      position: "relative",
    }}
  >
    {rowVirtualizer.virtualItems.map(virtualRow => <div
      key={virtualRow.index}
      ref={virtualRow.measureRef}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {list[virtualRow.index]}
    </div>)}
  </div></div>;
}
