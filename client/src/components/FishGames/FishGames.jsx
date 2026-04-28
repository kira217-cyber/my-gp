import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const FishGames = () => {
  return (
    <GameFlagSection
      flag="isFish"
      titleBn="ফিশ গেম"
      titleEn="Fish Games"
      emptyBn="কোনো ফিশ গেম পাওয়া যায়নি।"
      emptyEn="No Fish games found."
      icon={hot}
    />
  );
};

export default FishGames;