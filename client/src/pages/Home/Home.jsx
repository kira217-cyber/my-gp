import React from "react";
import Exposure from "../../components/Exposure/Exposure";
import Categories from "../../components/Categories/Categories";
import HomeProviders from "../../components/HomeProviders/HomeProviders";

const Home = () => {
  return (
    <div className="mb-32">
      <Exposure />
      <Categories />
      <HomeProviders />
    </div>
  );
};

export default Home;
