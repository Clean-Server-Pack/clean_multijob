import { Flex, Input, Text, useMantineTheme } from "@mantine/core";
import { useJob } from "../../providers/jobs/jobs";
import { useEffect, useState } from "react";

import { LineChart } from "@mantine/charts";
import HoverIcon from "../General/HoverIcon";
import { fetchNui } from "../../utils/fetchNui";

type EmployeesList = {
  [key: string]: {Hours: number, date: string}[]
}

export default function Employees(props: {selected: boolean}) {
  const theme = useMantineTheme();
  const {myData} = useJob();
  const [selectedJob, setSelectedJob] = useState('all');  
  const [employeeData, setEmployeeData] = useState<EmployeesList>({});
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [webhook, setWebhook] = useState('');
 

 



  useEffect(() => {
    const fetchData = async () => {
      //  fetch employees for selected job
      // return sample data for now
      if (!props.selected) return;
      const data = await fetchNui<{
        times: EmployeesList
        webhook: string
      }>('GET_EMPLOYEES_TIMES', {job: selectedJob});
      setEmployeeData(data.times);
      setWebhook(data.webhook);
    };

    fetchData();
  }, [selectedJob, props.selected])


  useEffect(() => {
    // pick the first jobn your a boss on and set it as selected
    myData.jobs.map((job) => {
      if (job.isboss) {
        setSelectedJob(job.name);
        return;
      } 
    })
  }, [myData.jobs])


  // const getAllJobs = () => {
  //   const res, err = funcs.isAdmin();
  //   if (err) return;
  //   if (res) {
  //     return fetchNui<{jobs: string[]}>('GET_ALL_JOBS');
  //   }else {
  //     return myData.jobs;
  //   } 
  // }

  return props.selected && (
    <Flex
      direction='column'
      flex={1}
      p='md'
      gap='md'
    >
      <Flex
      
        direction='column'
        gap='sm'
      >
        <Text size='2.5vh'>Select Job</Text>
        <Flex
          gap='xs'
        >

          {myData.jobs.map((job) => {
            if (!job.isboss) return null;
            return (
              <Flex
                bg='rgba(77,77,77,0.6)'
                p='md'
                onClick={() => setSelectedJob(job.name)}
                style={{
                  borderRadius:theme.radius.sm,
                  border: job.name === selectedJob ? `2px solid ${theme.colors[theme.primaryColor][9]}` : '2px solid rgba(77,77,77,0.6)',
                  cursor: 'pointer',
                }}
              >
                <Text
                  size='2vh'
                >{job.label}</Text>
              </Flex>
            )

          })}
      

        </Flex>
      </Flex>
      <Flex
        pt='xs'
        flex={1}
      >
        <Flex
          flex={0.25}
          direction='column'
          gap='xs'
        >
          <Text size='2.25vh'>Select Employee</Text>
          <Flex
            direction='column'
            gap='sm'
          >
            {/* Map employeeData and  */}
            {Object.entries(employeeData).map(([key]) => {
              return (
                <Flex
                  bg='rgba(77,77,77,0.6)'
                  p='md'
                  onClick={() => setSelectedEmployee(key)}
                  style={{
                    borderRadius:theme.radius.sm,
                    border: key === selectedEmployee ? `2px solid ${theme.colors[theme.primaryColor][9]}` : '2px solid rgba(77,77,77,0.6)',
                    cursor: 'pointer',
                  }}
                >
                  <Text
                    size='2vh'
                  >{key}</Text>
                </Flex>
              )
            })}
          </Flex> 
          <Flex
            mt='auto'
            direction='column'
            gap='xs'
          >
            <Text size='2.25vh'>Tracking Webhook</Text>
            <Flex
              gap='xs'
              align='center'
            >
              <Input flex={1}
                placeholder={webhook}
                value={webhook}
                onChange={(e) => setWebhook(e.currentTarget.value)}
              />
              <HoverIcon 
                icon='floppy-disk'
                onClick={() => {
                  fetchNui('SAVE_NEW_WEBHOOK', {job: selectedJob, webhook: webhook})
                }}

              />
            </Flex> 
          </Flex>

        </Flex>
        <LineChart
          legendProps={{
           
          }}
          h='95%'
          flex={1}
          strokeWidth={3}
          data={employeeData[selectedEmployee as keyof typeof employeeData]}
          dataKey="date"
          series={[
            { name: 'Hours', color: 'indigo.6' },
          ]}
          curveType="natural"
        />
      </Flex>

    </Flex>
  )
}