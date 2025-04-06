import React, { useState } from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'
import BackButton from '../components/BackButton'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const DeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const handleDeleteBook = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:5555/books/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Book Deleted Successfully', { variant: 'success' });
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        // alert("An error has occured. Please check the console.");
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  }
  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4 text-center'>Delete Book</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col items-center border-2 border-sky-500 rounded-xl p-8 mx-auto w-400'>
        <h3 className='text-2xl p-2'>Are you Sure you want to delete this book?</h3>
        <button className='p-4 bg-red-700 text-white m=8 w-20 rounded-2xl' onClick={handleDeleteBook}>
          Yes
        </button>
      </div>
    </div>
  )
}

export default DeleteBook