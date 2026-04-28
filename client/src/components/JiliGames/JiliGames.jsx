import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const JiliGames = () => {
  return (
    <GameFlagSection
      flag="isJili"
      titleBn="JILI গেম"
      titleEn="JILI Games"
      emptyBn="কোনো JILI গেম পাওয়া যায়নি।"
      emptyEn="No JILI games found."
      icon={hot}
    />
  );
};

export default JiliGames;