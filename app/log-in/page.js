'use client'

import { Box,Button,TextField, Typography} from "@mui/material"
import { useState } from "react"
import { auth } from "@/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"

const Login = () =>  {
    const [email,setEmail] =useState('')
    const [pass,setPass] =useState('')
    const router = useRouter()

    const handleSignUp = async () => {
        createUserWithEmailAndPassword(auth,email,pass)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log(user)
            handleSignIn()
          })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode,errorMessage)
        });
    }

    const handleSignIn = async () => {
        signInWithEmailAndPassword(auth,email,pass)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
            setEmail('')
            setPass('')
            router.push('/')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode,errorMessage)
          });
    }

    return(
        <Box display={'flex'} gap={2}
            justifyContent={'center'} flexDirection={'column'} alignItems={'center'}
        >
            <Box display={'flex'} gap={2} flexDirection={'column'} sx={{ borderRadius: 1 }} border={'1px solid #333'} bgcolor={'#bdcfda'} width={'35vw'} height={'50vh'} p={3} >
                <Typography variant='h5'>Log In/Sign Up</Typography>
                <TextField id="email" label="Email" variant="outlined" fullWidth 
                    value={email} onChange={(e) => setEmail(e.target.value)}></TextField>
                <TextField id="password" label="Password" variant="outlined" fullWidth 
                    value={pass} onChange={(e) => setPass(e.target.value)}></TextField>
                <Button variant="contained" onClick={() => handleSignIn()}>Log In</Button>
                <Button variant="contained" onClick={() => handleSignUp()}> Sign Up</Button>
            </Box>
        </Box>
    )
}

export default Login