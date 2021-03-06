import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { SET_BIRTHYEAR } from '../mutations'
import { ALL_AUTHORS } from '../queries'

const Authors = (props) => {
  const [ name, setName ] = useState('')
  const [ born, setBorn ] = useState('')

  useEffect(() => {
    if (props.authors) {
      setName(props.authors.allAuthors[0].name)
    }
  }, [ props.authors ])

  const [ setBirthyear ] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })

  if (!props.show) {
    return null
  } else if (!props.authors) {
    return <div>loading authors...</div>
  } else {

    let authors = props.authors.allAuthors

    const handleNameChange = async event => {
      event.preventDefault()

      setName(event.target.value)
      console.log('event.target.value: ', event.target.value)
    }


    const handleSubmit = async event => {
      event.preventDefault()
    
      let bornInt = parseInt(born)
      setBirthyear({ variables: { name, setBornTo: bornInt }})


      setName('')
      setBorn('')
    }

    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
              </th>
              <th>
                books
              </th>
            </tr>
            {authors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>

        <br></br>

        <h2>Set birthyear</h2>

        <form onSubmit={ handleSubmit }>
          <label>
            Choose the author whose birthyear you'd like to update: 
            <select value={ name } onChange={ handleNameChange }>
              {
                authors.map(a =>
                  <option value={ a.name } key={ a.name }>
                    { a.name }
                  </option>
              )}
            </select>
          </label>
          <br></br>
          born:
          <input
            value={ born }
            onChange={ ({ target }) => setBorn(target.value)}
          />
          <br></br>
          <button type='submit'>update author</button>
        </form>
  
      </div>
    )

  }


}

export default Authors
