import React, { useContext, useState } from "react";
import { SchemaContext } from "../estimateCustomizer/SchemaContextProvider";
import Expandable from "../utilComponents/Expandable";
import Library from "../estimateCalculator/subForms/Library";
import "./LibraryPage.css";

var selectedLib = { pID: 0, sID: 0, name: "", schema: {} };

function LibraryPage() {
  const { schema } = useContext(SchemaContext);
  const [libDisplay, setLibDisplay] = useState(false);
  console.log(schema);

  return (
    <div>
      <div className="TitleBar">
        <h1>Library</h1>
      </div>
      {schema.map((preset) => (
        <Expandable title={preset.estimateType + " Library"} large={true}>
          <div className="stageWrapper">
            {preset.form.map((stage) => (
              <div className="StageLibrary">
                <h2>{stage.canonicalName}</h2>
                <button
                  className="libButton button"
                  onClick={() => {
                    selectedLib = {
                      pID: preset.presetID,
                      sID: stage.stageID,
                      name: stage.canonicalName,
                      schema: stage,
                    };
                    setLibDisplay(true);
                  }}
                >
                  Access
                </button>
              </div>
            ))}
          </div>
        </Expandable>
      ))}
      {libDisplay ? (
        <Library
          setDisplay={setLibDisplay}
          name="Material"
          selectedLib={selectedLib}
        />
      ) : null}
    </div>
  );
}

export default LibraryPage;
