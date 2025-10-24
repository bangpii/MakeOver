import React, { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AnimasiTeks from '../components/AnimasiTeks';
import Footer from '../components/Footer';
import { getHello } from '../Api';

const User = () => {

  useEffect(() => {
    const fetchData = async () => {
      const data = await getHello();
      console.log("Message from backend:", data.message); // <-- log di console
    };
    fetchData();
  }, []);

  return (
    <div className='h-screen overflow-auto'>
      <Header/>
      <Hero/>
      <AnimasiTeks/>
      <Footer/>
    </div>
  );
};

export default User;
