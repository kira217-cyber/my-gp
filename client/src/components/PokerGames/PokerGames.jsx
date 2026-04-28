import React from "react";
import hot from "../../assets/hot.gif";
import GameFlagSection from "../GameFlagSection/GameFlagSection";

const PokerGames = () => {
  return (
    <GameFlagSection
      flag="isPoker"
      titleBn="পোকার গেম"
      titleEn="Poker Games"
      emptyBn="কোনো পোকার গেম পাওয়া যায়নি।"
      emptyEn="No Poker games found."
      icon={hot}
    />
  );
};

export default PokerGames;