import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import AnimasiTeks from '../components/AnimasiTeks'
import Footer from '../components/Footer'

const User = () => {
  return (
    <div className='h-screen overflow-auto '>
        <Header/>
        <Hero/>
        <AnimasiTeks/>
        <Footer/>
    </div>
  )
}

export default User