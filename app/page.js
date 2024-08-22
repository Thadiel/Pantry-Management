'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress } from '@mui/material'
import { auth, firestore } from '@/firebase'
import { collection, doc, getDocs,query, setDoc,deleteDoc,getDoc,} from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
}

export default function Home() {
    const [user,loading] = useAuthState(auth);
    const router = useRouter();
    const [inventory, setInventory] = useState([])
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')

    const email = user ? user.email : 'throwaway'
  

    const updateInventory = async () => {
        const snapshot = query(collection(firestore, email))
        const docs = await getDocs(snapshot)
        const inventoryList = []
        docs.forEach((doc) => {
          inventoryList.push({ name: doc.id, ...doc.data() })
        })
        setInventory(inventoryList)
        setResults(inventoryList)
      }

    useEffect(() => {
      if (!loading && !user) {
        router.push('/log-in');
      }
      else{
        updateInventory()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, router]);

    useEffect(() => {
      const invList=[]
      inventory.forEach((item) =>{
        if (item.name.includes(search)){
          invList.push(item);
        }
      });
      setResults(invList)
    },[search,inventory]);

    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent:'center'}}>
              <CircularProgress />
            </Box>; 
    }
    

    const addItem = async (item) => {
      const docRef = doc(collection(firestore, email), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        await setDoc(docRef, { quantity: data['quantity'] + 1 })
      } else {
        await setDoc(docRef, { quantity: 1 })
      }
      await updateInventory()
    }
    
    const removeItem = async (item) => {
      const docRef = doc(collection(firestore, email), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data= docSnap.data()

        if (data['quantity'] === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: data['quantity'] - 1 })
        }
      }
      await updateInventory()
    }

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    // We'll add our component logic here
    return (
        <Box display={'flex'} gap={2}
            justifyContent={'center'} flexDirection={'column'} alignItems={'center'}
        >
          <Button onClick={() => signOut(auth) }sx={{position:"absolute",display: "block", top:30,right:64 }} variant='outlined'>
            <Typography>{email}</Typography>
            <Typography>Log Out</Typography>
          </Button>
            <Modal open={open} onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" color={'black'} component="h2">
                Add Item
                </Typography>
                <Stack width="100%" direction={'row'} spacing={2}>
                <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName.trim().toLowerCase())
                      setItemName('')
                      handleClose()
                    }}
                >
                    Add
                </Button>
                </Stack>
            </Box>
            </Modal>
            <Button variant="contained" onClick={handleOpen}>
              Add New Item
            </Button>
            <TextField 
                  label="Search"
                  variant="outlined"
                  value={search}
                  sx={{width:'40%',height:'3rem'}}
                  onChange={(e) => setSearch(e.target.value)}
                />
            <Box border={'1px solid #333'}>
            <Box
                width="800px"
                height="100px"
                bgcolor={'#ADD8E6'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Inventory Items
                </Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
                {results.map(({name, quantity}) => (
                <Box
                    key={name} width="100%" minHeight="90px"
                    display={'flex'} justifyContent={'space-between'}
                    alignItems={'center'} bgcolor={'#f0f0f0'} paddingX={2}
                >
                    <Typography minWidth={300}maxWidth={300}variant={'h3'} color={'#333'} textAlign={'center'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography minWidth={200} variant={'h3'} color={'#333'} textAlign={'center'}>
                      Quantity:
                    </Typography>
                    <Button variant="outlined" sx={{width:'2.5rem', height:'2.5rem',textAlign:'center',fontSize:50, paddingBottom:'10px'}}onClick={() => removeItem(name)}>
                      -
                    </Button>
                    <Typography minWidth={50} variant={'h3'} color={'#333'} textAlign={'center'}>
                      {quantity}
                    </Typography>
                    <Button variant="outlined"  sx={{width:'2.5rem', height:'2.5rem',textAlign:'center',fontSize:40}} onClick={() => addItem(name)}>
                      +
                    </Button>
                    
                </Box>
                ))}
            </Stack>
            </Box>
        </Box>
    )
}
