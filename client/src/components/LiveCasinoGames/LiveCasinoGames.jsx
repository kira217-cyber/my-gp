import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const LiveCasinoGames = () => {
  return (
    <GameFlagSection
      flag="isLiveCasino"
      titleBn="লাইভ ক্যাসিনো"
      titleEn="Live Casino"
      emptyBn="কোনো লাইভ ক্যাসিনো গেম পাওয়া যায়নি।"
      emptyEn="No Live Casino games found."
      icon={hot}
    />
  );
};

export default LiveCasinoGames;