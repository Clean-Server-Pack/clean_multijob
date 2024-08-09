
import { Box, Button, Flex, Text, Title, alpha } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHover } from '@mantine/hooks';
import React, { useState } from "react";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { fetchNui } from "../../utils/fetchNui";
import { internalEvent } from "../../utils/internalEvent";
import './scroll.module.css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';


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
  maxSlots: number,
  mainOpened: boolean,
  jobs: JobProps,
  setMyJobs: React.Dispatch<React.SetStateAction<JobProps>>
}


type JobBoxProps = {
  maxSlots: number,
  number: number,
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
      <FontAwesomeIcon icon={icon as IconProp} size='lg' color={hovered ? hoverColor : color} />
    </Box> 
  )
}

type InfoBoxProps = {
  label: string,
  value: string | number,
  icon: string , 
  selected: boolean,



}

function InfoBox({label, value, icon, selected}: InfoBoxProps) {
  return (
    <Box 
      flex={0.33}
      w='33%'
      p='xs'
      bg={'rgba(55,55,55,0.6)'}
      style={{
        border: selected ? '2px solid var(--mantine-primary-color-9)' : '2px solid rgba(55,55,55,0.6)',
        borderRadius: 'var(--mantine-radius-sm)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontAwesomeIcon icon={icon as IconProp} size='sm' color='white' />
      <Flex 
        w='100%'
        direction='column'
        justify='center'
        align='center'
        p='xs'
      >
        <Title order={6}>{label}</Title>
        <Text 
          style={{
            textWrap: 'pretty',
          }}
        >{value}</Text>
      </Flex>

    </Box>
  )
}


function JobBox ({job, number, maxSlots, jobs, setMyJobs}: JobBoxProps) {
  const blurred = number + 1 > maxSlots && !job.selected && job.name !== 'unemployed';
  return (
    <Box 
      bg={alpha('dark.9', 0.5) }  


      p='sm'
      style={{
        userSelect: blurred ? 'none' : 'auto',
        filter: blurred ? 'blur(2px)' : 'none',
        border:job.selected ? '2px solid var(--mantine-primary-color-9)' : '2px solid rgba(55,55,55,0.6)',
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
              if (blurred) return;
              const new_jobs = {...jobs};
              delete new_jobs[job.name];
     

              fetchNui('JOB_DELETE', {
                job: job.name
              })

              // Set to unemployed 
              new_jobs['unemployed'].selected = true;


              

              // add count to unemployed 
              new_jobs['unemployed'].active = new_jobs['unemployed'].active + 1;

              setMyJobs(new_jobs);



            }}
            style={{
              marginLeft: 'auto'
            }}
          />
        }
      </Flex>

      <Flex dir='row' w='100%'  gap='sm' justify='center' p='xs'>
        <InfoBox label='Rank' value={job.rank_label} icon='star' selected={job.selected} />
        <InfoBox label='Salary' value={job.salary} icon='money-bill-wave' selected={job.selected} />
        <InfoBox label='Active' value={job.active} icon='user' selected={job.selected} />
      </Flex>

  
        <Flex dir='row' w='100%' justify='flex-end' gap='sm'>
          {job.selected && job.name !== 'unemployed' && 
            <Button variant={job.duty? 'light' : 'light'} color={
              job.duty ? 'red' : 'var(--mantine-primary-color-9)'
            } onClick={() => {
              if (blurred) return;

              const new_jobs = {...jobs};
              new_jobs[job.name].duty = !new_jobs[job.name].duty;
              setMyJobs(new_jobs);


              fetchNui('JOB_DUTY', {
                job: job.name,
                duty: new_jobs[job.name].duty
              })

            }}>
              {job.duty ? 'Off Duty' : 'On Duty'}
            </Button>
          }
          <Button variant={job.selected ? 'filled' : 'light'} color='var(--mantine-primary-color-9)' onClick={() => {
              if (blurred) return;
              const old_job = Object.keys(jobs).find((key) => jobs[key].selected);
              // If we are selecting a new job or deeselecting the current job then we need to set the active of the old job - 1
              if (old_job && old_job !== job.name) {
                const new_jobs = {...jobs};
                new_jobs[old_job].active = new_jobs[old_job].active - 1;
                setMyJobs(new_jobs);
              }

              // If we are selecting a new job then we need to set the active of the new job + 1
              if (old_job !== job.name) {
                const new_jobs = {...jobs};
                new_jobs[job.name].active = new_jobs[job.name].active + 1;
                setMyJobs(new_jobs);
              }

              const new_jobs = {...jobs};
              new_jobs[job.name].selected = !new_jobs[job.name].selected;
              // Also Set off duty if selected is false
              if (!new_jobs[job.name].selected) {
                new_jobs[job.name].duty = false;
              }


      
              // Deselect any other jobs 
              Object.keys(new_jobs).map((key) => {
                if (key !== job.name) {
                  new_jobs[key].selected = false;
                }
              })

              // If deselecting then set to unemployed
              if (!new_jobs[job.name].selected) {
                new_jobs['unemployed'].selected = true;
              }

              setMyJobs(new_jobs);


              // If they are selecting the job it sets to the job if deselecting it sets them back to a civ
              fetchNui('JOB_SELECT', {
                job: job.name,
                selected: new_jobs[job.name].selected
              })
            }}>
            {job.selected ? 'Deselect' : 'Select'}
          </Button>
    
        </Flex>
      
    </Box>




      
  )
}

function MyJobs({jobs, setMyJobs, mainOpened, maxSlots}: MyJobsProps) {
  const {hovered, ref } = useHover();
  const [ opened, setOpened ] = useState(false);


  return (
    <>

      <Box 
        opacity={opened && mainOpened ? 1 : 0 } 
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
        
          <Flex direction='row' align='center'>
            <Title order={3} ta={'center'}>My Jobs</Title>
            <Flex
              direction='row'
              align='center'
              ml='auto' gap='xs'
            >
              <Text size='xs' c='lightgrey'>SLOTS</Text>
              <Text fw='bold'>{Object.keys(jobs).length}/{maxSlots}</Text>
            </Flex>
          </Flex>
          <Flex 


            p='xs'
            direction='column'
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
            gap='sm'
            h='80vh'
        
          >
            {Object.keys(jobs).map((job, index) => {
              return (
                <JobBox key={index} number={index} job={jobs[job]} jobs={jobs} setMyJobs={setMyJobs} maxSlots={maxSlots} />
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
  const [maxSlots , setMaxSlots] = useState(1);
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
    },
    police : {
      name: 'police',
      label : 'Police',
      rank: 1, 
      rank_label: 'Cadet',
      duty: false,
      active: 0,
      salary: 0,
      selected:false, 
    }
  }); // { police: { label: 'Police', rank: 1, rank_label: 'Cadet', duty: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useNuiEvent('JOB_BAR_STATE' , (data: any) => {
    if (data.action === 'OPEN') {
      setOpened(true);
      setMyJobs(data.my_jobs);
      setMaxSlots(data.max_slots);
    }
    if (data.action === 'CLOSE') {
      setOpened(false);
    }

  })

  // Listen for escape key 
  React.useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key == ' F6') {
        if (opened){
          setTimeout(() => {
            setOpened(false)
            fetchNui('LOSE_FOCUS_JOB', {})
          }, 50)
        }
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
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
        <MyJobs jobs={my_jobs} setMyJobs={setMyJobs} mainOpened={opened} maxSlots={maxSlots} />

      </Box>

    </>
  );
}


internalEvent([
  {
    module: 'JobBar',
    action: 'JOB_BAR_STATE', 
    data: {
      action: 'OPEN', 
      max_slots: 2,
      my_jobs: {
        police: {
          label : 'Police',
          name: 'police',
          rank: 1, 
          rank_label: 'Cadet',
          duty: false,
          active: 0,
          salary: 0,
          selected:true,
        },

        unemployed: {
          label : 'Freelancer',
          name: 'unemployed',
          rank: 0, 
          rank_label: 'Freelancer',
          duty: false,
          active: 0,
          salary: 0,
          selected:false,
        },
    

        ambulance: {
          label : 'Ambulance',
          name: 'ambulance',
          rank: 1, 
          rank_label: 'Cadet',
          duty: false,
          active: 0,
          salary: 0,
          selected:false,
        },

        john: {
          label : 'John',
          name: 'john',
          rank: 1, 
          rank_label: 'Cadet',
          duty: false,
          active: 0,
          salary: 0,
          selected:false,
        },

      },


    }
  }
])

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
