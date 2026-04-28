import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const CrashGames = () => {
  return (
    <GameFlagSection
      flag="isCrash"
      titleBn="ক্র্যাশ গেম"
      titleEn="Crash Games"
      emptyBn="কোনো ক্র্যাশ গেম পাওয়া যায়নি।"
      emptyEn="No Crash games found."
      icon={hot}
    />
  );
};

export default CrashGames;