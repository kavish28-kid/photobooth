import { createElement, useMemo } from "react";

export function useTextReveal(parts){
  return useMemo(() => {
    let i = 0;
    return parts.map((part, key) => {
      if(typeof part !== "string") return part;
      return part.split(/(\s+)/).map((token) => {
        if(token.trim() === "") return token;
        return createElement("span", { className:"word", style:{ "--i": i++ }, key:`${key}-${i}` }, token);
      });
    });
  }, [parts]);
}
