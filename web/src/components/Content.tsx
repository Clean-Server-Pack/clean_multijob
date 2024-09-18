import { Flex, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useJob } from "../providers/jobs/jobs";
import MyJobs from "./MyJobs/MyJobs";
import Stats from "./Stats/main";



export default function Content(){
  const theme = useMantineTheme();
  const [rawDisplay, setRawDisplay] = useState(false);
  const [inView, setInView] = useState(false);
  const {myData} = useJob();

  useEffect(() => {
    if (myData.curPage === 'none') {
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
  }, [myData.curPage])

  return rawDisplay && (
    <Flex
      bg='rgba(0,0,0,0.8)'
      pos = 'absolute'
      top='5%'

      right={inView ? '5%' : '-25%'}
      style={{
        userSelect: 'none',
        transition: 'all ease-in-out 0.2s',
        borderRadius: theme.radius.sm,
      }}
    >
      {myData.curPage === 'jobs' && <MyJobs/>}
      {myData.curPage === 'stats' && <Stats/>}
    </Flex>
  )
}
