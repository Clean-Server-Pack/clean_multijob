import { Flex, Text, useMantineTheme } from "@mantine/core";
import { useJob } from "../../providers/jobs/jobs";
import JobCard from "./JobCard";


export default function MyJobs() {
  const theme = useMantineTheme();
  const {myData} = useJob();
  return (
    <Flex
      h='90vh'
      p='xs'
      gap='xs'
      direction='column'

    >
      <Flex
        pb='xs'
        style={{
          borderBottom: `1px solid ${theme.colors[theme.primaryColor][9]}`,
        }}
      >
        <Text
          size='2.8vh'
          style={{
            fontFamily: 'Akrobat Bold',
          }}
        >My Jobs</Text>

        <Flex
          align='center'
          w='fit-content'
          gap='xs'
          ml='auto'
        >
          <Text
            c='grey'
            size='2vh'
            style={{
              fontFamily: 'Akrobat Bold',
            }}
          >Job Slots</Text>
          <Text
            fw='bold'
            size='2.3vh'
          >{Object.keys(myData.jobs).length - 1}/{myData.maxSlots}</Text>

        </Flex>

      </Flex>
      <Flex
        direction='column'
        gap='xs'
        p='xs'
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        {myData.jobs.map((job, index) => {
          return <JobCard {...job} number={index - 1}/>
        })}
      </Flex>
    </Flex>
  )
}
