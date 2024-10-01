import React, { useState, useEffect } from 'react'

import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Fade from '@mui/material/Fade'
import { FormControl, Button } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'

import HtmlTooltip from '../Global/HtmlTooltip'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;



const MenuProps: any = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "center"
    },
    transformOrigin: {
        vertical: "top",
        horizontal: "center"
    },
    variant: "menu"
}

interface FormFieldErrorStates {
    globalWarming: boolean;
    photoConfig: boolean;
}

interface VizFormProps {
    globalWarmingSelected: string,
    setGlobalWarmingSelected: (val: string) => void,
    globalWarmingList: string[],
    photoConfigSelected: string,
    setPhotoConfigSelected: (val: string) => void,
    photoConfigList: string[],
    onFormDataSubmit: () => unknown,
    toggleOpen: () => void
}

const VizPrmsForm: React.FC<VizFormProps> = ({
    globalWarmingSelected,
    setGlobalWarmingSelected,
    photoConfigSelected,
    setPhotoConfigSelected,
    photoConfigList,
    globalWarmingList,
    onFormDataSubmit,
    toggleOpen
}) => {
    const [formErrorState, setFormErrorState] = useState<FormFieldErrorStates>({
        globalWarming: false,
        photoConfig: false
    })

    const handleSubmit = () => {
        toggleOpen()
        onFormDataSubmit()
    }

    return (
        <div className="viz-prms-form">
            <div className="package-contents">
                <Typography className="inline" variant="h5">Visualization Parameters</Typography>
                <div className="container container--package-setting">
                    <div className="option-group">
                        <Typography className="option-group__title" variant="body2">Global Warming Level</Typography>
                        <HtmlTooltip
                            textFragment={
                                <React.Fragment>
                                    <p>A &quot;global warming level&quot; refers to the increase in global-mean temperature with respect to preindustrial conditions.</p>
                                </React.Fragment>
                            }
                            iconFragment={<InfoOutlinedIcon />}
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement="right-end"
                        />

                        <FormControl>
                            <Select
                                value={globalWarmingSelected}
                                onChange={(event: any) => {
                                    setGlobalWarmingSelected(event.target.value as string)
                                }}
                                MenuProps={MenuProps}
                                sx={{ mt: '15px', width: '380px' }}
                                disabled
                            >
                                {globalWarmingList.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        <ListItemText primary={level} />
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrorState.globalWarming && <div>One or more global warming levels must be selected to continue</div>}
                        </FormControl>

                    </div>
                </div>
                <div className="container container--package-setting">
                    <div className="option-group">
                        <Typography className="option-group__title" variant="body2">Photovoltaic Configuration</Typography>
                        <HtmlTooltip
                            textFragment={
                                <React.Fragment>
                                    <p>The set of photovoltaic system design parameters. &quot;Utility&quot; is based on typical installations maintained by utility companies, while &quot;Distributed&quot; corresponds to a residential rooftop installation.
                                    </p>
                                </React.Fragment>
                            }
                            iconFragment={<InfoOutlinedIcon />}
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement="right-end"
                        />

                        <FormControl>
                            <FormLabel id="demo-controlled-radio-buttons-group"></FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={photoConfigSelected}
                                onChange={(event: any) => {
                                    setPhotoConfigSelected(event.target.value as string)
                                }}
                            >
                                {photoConfigList.map((photoConfig) => (
                                    <FormControlLabel value={photoConfig} key={photoConfig} control={<Radio />} label={photoConfig} />
                                ))}

                            </RadioGroup>
                        </FormControl>

                    </div>
                </div>

                {/**                <div className="cta">
                    <Button onClick={() => {
                        handleSubmit()
                    }} variant="contained">Refresh your visualization</Button>
                </div> */}

            </div>

        </div>
    )
}

export default VizPrmsForm