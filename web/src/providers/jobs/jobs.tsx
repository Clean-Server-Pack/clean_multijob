import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { fetchNui } from "../../utils/fetchNui"
import { useNuiEvent } from "../../hooks/useNuiEvent"
import { isEnvBrowser } from "../../utils/misc"
import { BackgroundImage, Text } from "@mantine/core"

export type JobProps = {
  name: string,
  label: string,
  rank: number,
  selected: boolean,
  rank_label: string,
  duty: boolean,
  active: number,
  salary: number,
  isboss?: boolean
}

type JobDataProps = {
  opened: boolean
  curPage: string
  jobs: JobProps[];
  maxSlots: number
}

type JobFuncsProps = {
  setOpened: (open: boolean) => void
  setPage: (page: string) => void
  setSelectedJob: (job: string) => void
  setDuty: (job: string, duty: boolean) => void
  getBossJobs: () => JobProps[]
  deleteJob: (job: string) => void
  isAdmin: () => Promise<boolean>


}

type JobContextType = {
  myData: JobDataProps 
  funcs: JobFuncsProps

}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myData, setMyData] = useState<JobDataProps>({
    opened: isEnvBrowser(),
    curPage: 'none',
    jobs: [
      {
        name: 'unemployed',
        label: 'Unemployed',
        rank: 0,
        selected: false,
        rank_label: 'Unemployed',
        duty: false,
        active: 0,
        salary: 0,
      },
      {
        name: 'polcie',
        label: 'Police Officer',
        rank: 0,
        selected: false,
        rank_label: 'Unemployed',
        duty: false,
        active: 0,
        salary: 0,
        isboss: true
      },
      {
        name: '711',
        label: '711 Worker',
        rank: 0,
        selected: false,
        rank_label: 'Unemployed',
        duty: false,
        active: 0,
        salary: 0,
        isboss: true
      },
      {
        name: 'fireman',
        label: 'Fireman',
        rank: 0,
        selected: false,
        rank_label: 'Unemployed',
        duty: false,
        active: 0,
        salary: 0,
      },
      {
        name: 'busman',
        label: 'Bus Driver',
        rank: 0,
        selected: false,
        rank_label: 'Unemployed',
        duty: false,
        active: 0,
        salary: 0,
      },
    ],  
    maxSlots: 2,
  })


  useNuiEvent('OPEN_MENU', (data: {
    jobs: JobProps[],
    maxSlots: number
  }) => {
    setMyData({
      ...myData,
      opened: true,
      jobs: data.jobs,
      maxSlots: data.maxSlots
    })
  })


  useNuiEvent('CLOSE_MENU', () => {
    setMyData({
      ...myData,
      opened: false
    })
  })


  const funcs = {
    setPage: (page: string) => {
      setMyData({
        ...myData,
        curPage: page
      })
    },

    setOpened: (open: boolean) => {
      setMyData({
        ...myData,
        opened: open
      })
    }, 

    isAdmin: async () => {
      // check if player is admin
      const isAdmin = await fetchNui<boolean>('IS_ADMIN', {})
      return isAdmin
    },  

    getBossJobs: () => {
      const jobs = myData.jobs.filter((job) => job.isboss)
      return jobs 
    },

    deleteJob: (job: string) => {
      // delete job from list


      fetchNui('JOB_DELETE', {job: job}).then((res) => {
        if (res) {
          const newJobs = myData.jobs.filter((j) => j.name !== job)
          setMyData({
            ...myData,
            jobs: newJobs
          })

        }
   
      })
    },

    setSelectedJob: (job: string) => {
      // set selected job and remove selected from all others
      // lower count by 1 of old job 
      const current_job = myData.jobs.find((j) => j.selected)
      if(current_job){
        current_job.active -= 1
      }
      

      const newJobs = myData.jobs.map((job) => {
        return {
          ...job,
          duty: false,
          selected: false
        }
      })

      const selectedJob = newJobs.find((j) => j.name === job)

      if (selectedJob) {
        selectedJob.selected = true
        selectedJob.duty = false
        selectedJob.active += 1
      }

      setMyData({
        ...myData,
        jobs: newJobs
      })

      fetchNui('JOB_SELECT', {job: job})
    },

    setDuty: (job: string, duty: boolean) => {
      // set duty for job and remove duty from all others
      const newJobs = myData.jobs.map((job) => {
        return {
          ...job,
          duty: false
        }
      })

      const selectedJob = newJobs.find((j) => j.name === job)

      if (selectedJob) {
        selectedJob.duty = duty
      }
      
      setMyData({
        ...myData,
        jobs: newJobs
      })

      fetchNui('JOB_DUTY', {job: job, duty: duty})
    }
  }


  useEffect(() => {
    funcs.setPage('none')
  }, [myData.opened])



  // Listen for escape key 
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key == ' F6') {
        if (myData.opened) {
          setTimeout(() => {
            funcs.setOpened(false)
            fetchNui('LOSE_FOCUS_JOB', {})
          }, 50)
        }
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  });
  
  return (
    <JobContext.Provider value={{myData, funcs}}>
      {isEnvBrowser() ? (
        <BackgroundImage src="https://gcdnb.pbrd.co/images/rjKIWn6FNpDF.jpg?o=1" h='100vh' w='100vw'>
          <Text fw='bolder' size='lg' c='red' ml='lg' mt='lg'> BROWSER</Text>
          {children}
        </BackgroundImage>
      ): children}

    </JobContext.Provider>
  );
};

const useJob = (): JobContextType => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};

export { useJob }