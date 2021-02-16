import React, { useState, useEffect } from 'react'
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { API, Storage } from 'aws-amplify';
import { getPost } from './graphql/queries';
import Button from './Button';
// my first git commit
export default function Post() {
  const [loading, updateLoading] = useState(true);
  const [post, updatePost] = useState(null);
  const { id } = useParams()
  useEffect(() => {
    fetchPost()
  }, [])
  async function fetchPost() {
    try {
      // This is to return the post
        const postData = await API.graphql({
            query: getPost, variables: { id }
          });
      const currentPost = postData.data.getPost
      // Returns image value from post
      const image = await Storage.get(currentPost.image);
      console.log ("Value of image from dynamodb", currentPost.image)
      // If currentPost.image is not empty string, then the photo exists in S3 bucket
      console.log ("Value of image from S3", image)
      currentPost.image = image;
      updatePost(currentPost);
      updateLoading(false);
    } catch (err) {
      console.log('error: ', err)
    }
  }
  if (loading) return <h3>Loading...</h3>
  console.log('post: ', post)
  return (
    <>
      <Button title="Edit" />
      <h3 className={titleStyle}>{"Title: " + post.name}</h3>
      <h3 className={projectStyle}>{"Project: " + post.project}</h3>
      <h3>{"Team: " + post.team}</h3>
      <h3>{"Vertical: " + post.vertical}</h3>
      <h3>{"Date: " + post.date}</h3>
      <h3>{"Program: " + post.program}</h3>
      <h3>{"Owner: " + post.contentowner}</h3>
      <h3>{"Tags: " + post.tags}</h3>


      <img alt="post" src={post.image} className={imageStyle} /> 
    </>
  )
}
// Line 45 displays value of the image

const titleStyle = css`
  margin-bottom: 7px;
`

const projectStyle = css`
  color: #0070f3;
  margin: 0;
`

const imageStyle = css`
  width: 100px;
  }
`