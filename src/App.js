import React, { useState, useEffect } from "react";
import { RemoteFile } from "generic-filehandle";
import NCList from "@gmod/nclist";

const queryParameters = new URLSearchParams(window.location.search)
  const assembly = queryParameters.get("assembly")
  const release  = queryParameters.get("release")
  const refseq   = queryParameters.get("refseq")
  const start    = queryParameters.get("start")
  const end      = queryParameters.get("end")
  

async function accessStore() {
  const store = new NCList({
    baseUrl:
      "https://s3.amazonaws.com/agrjbrowse/MOD-jbrowses/WormBase/WS"+release+"/"+assembly+"/",
    urlTemplate: "tracks/Curated_Genes/{refseq}/trackData.jsonz",
    readFile: (url) => new RemoteFile(url).readFile(),
  });

  const features = [];
  for await (const feature of store.getFeatures({
    refName: refseq,
    start: start,
    end: end,
  })) {
    console.log(
      `got feature at ${feature.get("seq_id")}:${feature.get(
        "start"
      )}-${feature.get("end")}`
    );
    features.push(feature);
  }
  return features;
}
export default function App() {
  const [result, setResult] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    (async () => {
      try {
        const stuff = await accessStore();
        setResult(stuff);
      } catch (e) {
        setError(e);
      }
    })();
  }, []);
  if (error) {
    return <div style={{ color: "red" }}>{`${error}`}</div>;
  } else if (!result) {
    return <div>Loading...</div>;
  } else {
    return (
      <ul>
        {result.map((feature) => {
          return (
            <li key={feature.id()}>
              {feature.get("name")} {feature.get("seq_id")}:
              {feature.get("start")}-{feature.get("end")}
            </li>
          );
        })}
      </ul>
    );
  }
}
