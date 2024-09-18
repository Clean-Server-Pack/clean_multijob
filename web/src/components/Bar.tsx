import { Flex } from "@mantine/core";
import { useJob } from "../providers/jobs/jobs";
import { useEffect, useState } from "react";
import HoverIcon from "./General/HoverIcon";
import { useSettings } from "../providers/settings/settings";

export default function Bar() {
  const {myData, funcs} = useJob();
  const [rawDisplay, setRawDisplay] = useState(false);
  const [inView, setInView] = useState(false);
  const settings = useSettings();

  useEffect(() => {
    if (!myData.opened) {
      setInView(false);
      setTimeout(() => {
        setRawDisplay(false);
      } , 200)
    } else {
      setRawDisplay(true);
      setTimeout(() => {
        setInView(true);
      }, 200)
    }
  }, [myData.opened])

  return rawDisplay && (

    <Flex
      pos='absolute'
      right={inView ? '0' : '-25%'}
      top='0'
      h='100vh'
      p='xs'
      bg='rgba(0,0,0,0.8)'
      align='center'
      direction={'column'}
      gap='xs'
      style={{
        transition: 'all ease-in-out 0.2s',
        userSelect: 'none',
      }}

    >
      <HoverIcon 
        selected={myData.curPage === 'jobs'}
        disableTip={myData.curPage === 'jobs'}
        tooltip="My Jobs"
        fontSize='3vh'
        icon='bars'
        color='white'
        onClick={() => {
          myData.curPage === 'jobs' ? funcs.setPage('main') : funcs.setPage('jobs');
        }}
      />

      {settings.enableTimeTracking && (
        <HoverIcon
        selected={myData.curPage === 'stats'}
        disableTip={myData.curPage === 'stats'}
        tooltip="Job Stats"   
        fontSize='3vh'
        icon='chart-simple'
        color='white'
        onClick={() => {
          myData.curPage === 'stats' ? funcs.setPage('main') : funcs.setPage('stats');
        }}
      />
      )}



    </Flex>

  )
}