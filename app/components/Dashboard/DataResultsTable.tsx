import React, { useState, useEffect } from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Button } from '@mui/material'

import { searchObject, handleDownload } from '@/app/utils/functions'

interface DataResultsProps {
    varsResData: any[],
    selectedVars: string[]
}

const DataResultsTable: React.FC<DataResultsProps> = ({ varsResData, selectedVars }) => {
    return (
        <TableContainer sx={{mt: '15px'}} component={Paper}>
            <Table aria-label="Data Results table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Download</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {varsResData.map((variable) => (

                        searchObject(selectedVars, variable.name) &&
                        <TableRow
                            key={variable.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {variable.name}
                            </TableCell>
                            <TableCell align="right">
                                <Button variant="contained" color="primary" onClick={() => { handleDownload(variable.href) }}>
                                    Download File
                                </Button>
                            </TableCell>
                        </TableRow>


                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default DataResultsTable