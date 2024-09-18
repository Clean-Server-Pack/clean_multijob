import { Flex, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { useJob } from "../../providers/jobs/jobs";
import Personal from "./Personal";
import Employees from "./Employees";

export default function Stats() {
  const theme = useMantineTheme();
  const [selectedTab, setSelectedTab] = useState('personal');
  const {funcs} = useJob();
  return (
    <Flex
      h='90vh'
      w='85vw'
      direction={'column'}
    > 
      <Flex
        gap='md'
        p='xs'
        bg='rgba(77,77,77,0.6)'
      >

        <Text
          pr='xs'
          pl='xs'
          pb='xs'
          size='3vh'
          style={{
            cursor: 'pointer',
            fontFamily: 'Akrobat Bold',
            // border on bottom 
            borderBottom: selectedTab === 'personal' ? `2px solid ${theme.colors[theme.primaryColor][9]}` : '2px solid rgba(255,255,255,0.2)',

          }}

          onClick={() => setSelectedTab('personal')}

        >Personal</Text>
 
        {funcs.getBossJobs().length > 0 && (
          <Text
            pr='xs'
            pl='xs'
            size='3vh'
            pb='xs'
            style={{
              cursor: 'pointer',
              fontFamily: 'Akrobat Bold',
              borderBottom: selectedTab === 'employees' ? `2px solid ${theme.colors[theme.primaryColor][9]}` : '2px solid rgba(255,255,255,0.2)',
            }}
            onClick={() => setSelectedTab('employees')}
          >Employees</Text>
        )}
      </Flex>

      <Personal selected={selectedTab === 'personal'}/>
      <Employees selected={selectedTab === 'employees'}/>
    </Flex>
  )
}

