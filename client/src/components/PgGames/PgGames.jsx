import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const PgGames = () => {
  return (
    <GameFlagSection
      flag="isPg"
      titleBn="লবি গেম"
      titleEn="Lobby Games"
      emptyBn="কোনো PG গেম পাওয়া যায়নি।"
      emptyEn="No PG games found."
      icon={hot}
    />
  );
};

export default PgGames;