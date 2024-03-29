import Head from 'next/head'
import Image from 'next/image'
import Header from '../Components/Header'
import Feed from '../Components/Feed'
import Modal from '../Components/Modal'
//import styles from '../styles/Home.module.css'

export default function Home() {


  return (
    <div className="bg-gray-50 h-screen overflow-y-scroll scrollbar-hide" >
      <Head>
        <title>farmers market app</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

     

      {/*HEADER */}
    <Header />
      

      {/*FEED */}

      <Feed />

      {/*MODAL */}

       <Modal />
      
    
    </div>



  )
 
}