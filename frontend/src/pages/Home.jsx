import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import BookTable from "../components/home/BookTable";
import BookCard from "../components/home/BookCard";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState("table");

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5555/books")
      .then((response) => {
        setBooks(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);
  return (
    <div className="p-4">
      <div className="flex justify-center items-center gap-x-4 ">
        <button
          className="bg-sky-400 hover:bg-sky-800 p-4 rounded-lg text-2xl text-white duration-300 ease-in-out"
          onClick={() => setShowType("table")}
        >
          Table
        </button>
        <button
          className="bg-sky-400 hover:bg-sky-800 p-4 rounded-lg text-2xl text-white duration-300 ease-in-out  "
          onClick={() => setShowType("card")}
        >
          Card
        </button>
        <Button variant="outline">Button</Button>
        <Drawer>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-3xl my-8">Books List</div>
        <Link to="/books/create">
          <MdOutlineAddBox className="text-sky-800 text-4xl" />
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : showType === "table" ? (
        <BookTable books={books} />
      ) : (
        <BookCard books={books} />
      )}
    </div>
  );
};

export default Home;
