import React, { useState, useEffect } from "react";
import { RemoteFile } from "generic-filehandle";
import NCList from "@gmod/nclist";

async function accessStore() {
  const store = new NCList({
    baseUrl:
      "https://s3.amazonaws.com/agrjbrowse/MOD-jbrowses/WormBase/WS286/c_elegans_PRJNA13758/",
    urlTemplate: "tracks/Curated_Genes/{refseq}/trackData.jsonz",
    readFile: (url) => new RemoteFile(url).readFile(),
  });

  const features = [];
  for await (const feature of store.getFeatures({
    refName: "I",
    start: 5720822,
    end: 5732439,
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
