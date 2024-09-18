import { Flex, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useJob } from "../../providers/jobs/jobs";
import { LineChart } from "@mantine/charts";
import { useSettings } from "../../providers/settings/settings";
import { fetchNui } from "../../utils/fetchNui";

export default function Personal(props: {selected: boolean}) {
  const theme = useMantineTheme();
  const settings = useSettings();
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobData, setJobData] = useState([])
  const {myData} = useJob();

  useEffect(() => {
    if (props.selected){
      fetchNui('GET_PERSONAL_TIMES', {job: selectedJob}).then((data) => {
        setJobData(data as unknown as typeof jobData)
      })
    }
  }, [props.selected, selectedJob])

  return props.selected && (
    <Flex
      flex={1}
      p='md'
    >
      <Flex
        direction='column'
        // bg='red'
        flex={0.25}
        align={'center'}
        gap='xs'
      >
        {myData.jobs.map((job) => {
          if (job.name === settings.unemployedJob) return null
          return ( 
            <Flex
              key={job.name}
              p='xs'
              w='100%'
              bg='rgba(77,77,77,0.6)'
              align='center'
              justify='center'
              onClick={() => setSelectedJob(job.name)}
              style={{
                cursor: 'pointer',
                outline: job.name === selectedJob ? `2px solid ${theme.colors[theme.primaryColor][9]}` : 'none',
              }}
            >
              <Text size='2vh'>{job.label}</Text>
            </Flex>
          )
        })}
      </Flex>

      <Flex
        flex={1}
        p='lg'
      >
        <LineChart
          unit=' Hours'
          h='95%'
          flex={1}
          strokeWidth={3}
          data={jobData}
          dataKey="date"
          series={[
            { name: 'Hours', color: theme.colors[theme.primaryColor][9] },
          ]}
          curveType="natural"
        />

      </Flex>


    </Flex>
  )
}
