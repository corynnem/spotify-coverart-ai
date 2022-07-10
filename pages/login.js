import React from "react";
import { getProviders, signIn } from 'next-auth/react'
import logo from '../public/spotify.png'


const Login = ({providers}) => {

    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: '#343a40', height: '100vh'}}>
            <img src={logo.src} style={{height: '200px'}}/>
            {
                Object.values(providers).map((provider) => {
                    return (
                        <div key={provider}>
                            <br/>
                            <button onClick={() => signIn(provider.id, { callbackUrl: '/'})} style={{height: '60px', width: '170px', border: 'transparent', borderRadius: '50px', backgroundColor: '#18D860'}}>Login with {provider.name}</button>
                        </div>
                    )
                })
            }
        </div>
    )
} 

export default Login;


export async function getServerSideProps() {
    const providers = await getProviders()

    return {
        props: {
            providers
        }
    }
}