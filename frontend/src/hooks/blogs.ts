import { useEffect, useState } from "react"
import axios from "axios";

export interface Blog {
    "content": string;
    "title": string;
    "_id": string; // Changed from "id": number
    "author": {
        "name": string;
        "_id": string; // Added author id
    };
    "createdAt": string; // Added createdAt field
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();
    const port = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${port}/api/blogs/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }
}

export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const port = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${port}/api/blogs/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlogs(response.data.blogs);
                setLoading(false);
            })
    }, [])

    return {
        loading,
        blogs
    }
}