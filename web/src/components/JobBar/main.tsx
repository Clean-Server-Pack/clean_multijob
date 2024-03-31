
import {Box, Center, Image, Title, Text, alpha, Flex, Button, Group} from '@mantine/core';

import {useHover} from '@mantine/hooks';
import React, { useState } from "react";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { fetchNui } from "../../utils/fetchNui";
import { internalEvent } from '../../utils/internalEvent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



type JobProps = {
  [key: string]: {
    name: string,
    label: string,
    rank: number,
    selected: boolean,
    rank_label: string,
    duty: boolean,
    active: number,
    salary: number,
  }
}

type MyJobsProps = {
  jobs: JobProps,
  setMyJobs: React.Dispatch<React.SetStateAction<JobProps>>
}


type JobBoxProps = {
  job: {
    name: string,
    label: string,
    selected: boolean,
    rank: number,
    rank_label: string,
    duty: boolean,
    active: number,
    salary: number,
  },
  jobs: JobProps,
  setMyJobs: React.Dispatch<React.SetStateAction<JobProps>>
}

type HoverIconProps = {
  style?: React.CSSProperties,
  icon: string,
  color: string,
  hoverColor: string,
  onClick: () => void
}

function HoverIcon({style, icon, color, hoverColor, onClick}: HoverIconProps) {
  const {hovered, ref} = useHover();

  return (
    <Box 
      ref={ref}
      bg={hovered ? alpha('dark.9', 0.8) : alpha('rgb(55,55,55)', 0.6)}
      p='0.2rem'
      style={{
        borderRadius: 'var(--mantine-radius-sm)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all ease-in-out 0.2s',
        ...style
      }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} size='lg' color={hovered ? hoverColor : color} />
    </Box>
  )
}

type InfoBoxProps = {
  label: string,
  value: string | number,
  icon: string  
}

function InfoBoxProps({label, value, icon}: InfoBoxProps) {
  return (
    <Box 
      flex={0.33}
      bg={alpha('var(--mantine-primary-color-9)', 0.9)}
      style={{
        borderRadius: 'var(--mantine-radius-xs)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontAwesomeIcon icon={icon} size='sm' color='white' />
      <Flex 
        direction='column'
        justify='center'
        align='center'
        p='xs'
      >
        <Title order={6}>{label}</Title>
        <Text>{value}</Text>
      </Flex>

    </Box>
  )
}


function JobBox ({job, jobs, setMyJobs}: JobBoxProps) {
  return (
    <Box 
      bg={alpha('dark.9', 0.5) }  
      p='sm'
      style={{
        border:job.selected ? '2px solid var(--mantine-primary-color-9)' : '2px solid transparent',
        borderRadius: 'var(--mantine-radius-sm)',
        transition: 'all ease-in-out 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      w='100%'

    > 
      <Flex dir='row' align='center' w='100%'>
        <Title order={5} ta='center'>{job.label}</Title>

        
        {(job.name !== 'unemployed') && 
          <HoverIcon icon='dumpster' hoverColor='rgba(255,0,0,0.8)' color='white' 
            onClick={() => {
              const new_jobs = {...jobs};
              delete new_jobs[job.label.toLowerCase()];
     

              fetchNui('JOB_DELETE', {
                job: job.label.toLowerCase()
              })

              // Set to unemployed 
              new_jobs['unemployed'].selected = true;

              setMyJobs(new_jobs);



            }}
            style={{
              marginLeft: 'auto'
            }}
          />
        }
      </Flex>

      <Flex dir='row' w='100%'  gap='sm' justify='center' p='xs'>
        <InfoBoxProps label='Rank' value={job.rank_label} icon='star' />
        <InfoBoxProps label='Salary' value={job.salary} icon='money-bill-wave' />
        <InfoBoxProps label='Active' value={job.active} icon='user' />
      </Flex>

  
        <Flex dir='row' w='100%' justify='flex-end' gap='sm'>
          {job.selected && job.name !== 'unemployed' && 
            <Button variant={job.duty? 'light' : 'light'} color={
              job.duty ? 'red' : 'var(--mantine-primary-color-9)'
            } onClick={() => {
              const new_jobs = {...jobs};
              new_jobs[job.label.toLowerCase()].duty = !new_jobs[job.label.toLowerCase()].duty;
              setMyJobs(new_jobs);


              fetchNui('JOB_DUTY', {
                job: job.label.toLowerCase(),
                duty: new_jobs[job.label.toLowerCase()].duty
              })

            }}>
              {job.duty ? 'Off Duty' : 'On Duty'}
            </Button>
          }
          <Button variant={job.selected ? 'filled' : 'light'} color='var(--mantine-primary-color-9)' onClick={() => {
              const new_jobs = {...jobs};
              new_jobs[job.label.toLowerCase()].selected = !new_jobs[job.label.toLowerCase()].selected;
              // Also Set off duty if selected is false
              if (!new_jobs[job.label.toLowerCase()].selected) {
                new_jobs[job.label.toLowerCase()].duty = false;
              }
      
              // Deselect any other jobs 
              Object.keys(new_jobs).map((key) => {
                if (key !== job.label.toLowerCase()) {
                  new_jobs[key].selected = false;
                }
              })

              // If deselecting then set to unemployed
              if (!new_jobs[job.label.toLowerCase()].selected) {
                new_jobs['unemployed'].selected = true;
              }

              setMyJobs(new_jobs);


              // If they are selecting the job it sets to the job if deselecting it sets them back to a civ
              fetchNui('JOB_SELECT', {
                job: job.label.toLowerCase(),
                selected: new_jobs[job.label.toLowerCase()].selected
              })
            }}>
            {job.selected ? 'Deselect' : 'Select'}
          </Button>
    
        </Flex>
      
    </Box>




      
  )
}

function MyJobs({jobs, setMyJobs}: MyJobsProps) {
  const {hovered, ref } = useHover();
  const [ opened, setOpened ] = useState(false);


  return (
    <>

      <Box 
        opacity={opened ? 1 : 0 } 
        bg={alpha('dark.9', 0.8)}
        h='auto'  
        w='25rem'
        p='sm'
         
        pos='absolute' 
        top='5%' 
        right='5rem' 
        style={{
          borderRadius: 'var(--mantine-radius-sm)',
          transition: 'all ease-in-out 0.2s',
        }}  
      >
        
          <Title order={3} ta={'center'}>My Jobs</Title>
          <Flex 
            direction='column'
            
            gap='sm'
          >
            {Object.keys(jobs).map((job, index) => {
              return (
                <JobBox key={index} job={jobs[job]} jobs={jobs} setMyJobs={setMyJobs} />
              )
            })}
          </Flex>
      </Box>
 




      <Box 
        bg={ (hovered || opened )? 'var(--mantine-primary-color-9)' : 'gray'} 
        p='0.35rem'
        ref={ref}
        style={{
          borderRadius: 'var(--mantine-radius-sm)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', 
          cursor: 'pointer',
          transition: 'all ease-in-out 0.1s',
        }}




          onClick={() => setOpened(!opened)}
        >
        <FontAwesomeIcon icon='bars' size='2x' color='white' onClick={() => setOpened(!opened)} />
      </Box>
    
    
    </>






  )
}






export default function JobBar() {
  const [ opened, setOpened ] = useState(false);
  const [ my_jobs, setMyJobs ] = useState<JobProps>({
    unemployed: {
      name: 'unemployed',
      label : 'Unemployed',
      rank: 1, 
      rank_label: 'Bum',
      duty: false,
      active: 0,
      salary: 0,
      selected:true, 
    }
  }); // { police: { label: 'Police', rank: 1, rank_label: 'Cadet', duty: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useNuiEvent('JOB_BAR_STATE' , (module, data: any) => {
    if (data.action === 'OPEN') {
      setOpened(true);
      setMyJobs(data.my_jobs);

    }
    if (data.action === 'CLOSE') {
      setOpened(false);
    }

  })

  // Listen for escape key 
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (opened){
          setOpened(false)
          fetchNui('LOSE_FOCUS', {})
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
  


  return (
    <>
 
      <Box
        pos='absolute'
        top='0'
        right={opened ? '0' : '-4rem'}
        bg={alpha('dark.9', 0.8)}
        h='100%'
        w='auto'
        p='sm'
        display='flex'
        




        style={{ 
          transition: 'all ease-in-out 0.2s',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
      
        }}
      >
        <MyJobs jobs={my_jobs} setMyJobs={setMyJobs} />

      </Box>

    </>
  );
}


// internalEvent([
//   {
//     module: 'JobBar',
//     action: 'JOB_BAR_STATE', 
//     data: {
//       action: 'OPEN', 
//       my_jobs: {
//         police: {
//           label : 'Police',
//           name: 'police',
//           rank: 1, 
//           rank_label: 'Cadet',
//           duty: false,
//           active: 0,
//           salary: 0,
//           selected:true,
//         },

//         unemployed: {
//           label : 'Unemployed',
//           name: 'unemployed',
//           rank: 0, 
//           rank_label: 'Bum',
//           duty: false,
//           active: 0,
//           salary: 0,
//           selected:false,
//         }

//       }
//     }
//   }
// ])

// setTimeout(() => {
//   internalEvent([
//     {
//       module: 'JobBar',
//       action: 'JOB_BAR_STATE', 
//       data: {
//         action: 'CLOSE', 
//       }
//     }
//   ])
// }, 5000)
