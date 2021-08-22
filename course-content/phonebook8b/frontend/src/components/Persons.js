import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
//acts just like useQuery, difference: doesn't immediately execute query. Returns a tuple containing a function that you can call when ready to execute the query
import { FIND_PERSON } from '../queries'

const Persons = ({ persons }) => {
    const [ getPerson, result ] = useLazyQuery(FIND_PERSON)
    const [ person, setPerson ] = useState(null)

    //when a person's 'show address' button is clicked, event handler showPerson is executed -> makes GraphQL query with the person's name as a variable
    const showPerson = name => {
        getPerson( { variables: { nameToSearch: name } } )
    }

    useEffect(() => {
        if (result.data) {
            setPerson(result.data.findPerson)
        }
    }, [result])

    if (person) {
        return (
            <div>
                <h2> { person.name } </h2>
                <div> { person.address.street } { person.address.city } </div>
                <div> { person.phone } </div>
                <button onClick={() => setPerson(null)}> close </button>
            </div>
        )
    }

    return (
        <div>
            <h2>Persons</h2>
            {
                persons.map(p => 
                    <div key={p.name}>
                        { p.name } { p.phone }
                        <button onClick={() => showPerson(p.name)}>
                            show address
                        </button>
                    </div>
                    
                )
            }
        </div>
    )
}

export default Persons