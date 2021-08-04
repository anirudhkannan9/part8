import React from 'react'

const Authors = (props) => {
  if (!props.show) {
    return null
  } else if (!props.authors) {
    return <div>loading authors...</div>
  } else {

    let authors = props.authors.allAuthors

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
  
      </div>
    )

  }


}

export default Authors
