import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { JobProps, useJob } from "../../providers/jobs/jobs";
import colorWithAlpha from "../../utils/colorWithAlpha";
import InfoBox from "../General/InfoBox";
import Button from "../General/Button";
import { useSettings } from "../../providers/settings/settings";




function DeleteButton({job}: {job: string}) {
  const {ref, hovered} = useHover();
  const {funcs} = useJob();
  return (
    <Flex
      ref={ref}
      ml='auto'

    >
      <FontAwesomeIcon 
        onClick={() => {
          funcs.deleteJob(job);
        }}
        style={{
          marginLeft: 'auto',
          cursor: 'pointer',
          transition: 'all ease-in-out 0.2s',
          fontSize: '2vh',
        }}
        icon='trash' 
         
        color={hovered ? 'rgba(255,0,0,0.7)' : 'grey'}  
      />
    </Flex>
  )
}

function JobCard (props: JobProps & {number: number}) {
  const {myData, funcs} = useJob();
  const settings = useSettings();
  const blurred = (props.number + 1) > myData.maxSlots && !props.selected && props.name !== settings.unemployedJob;
  const theme = useMantineTheme();
  return (
    <Flex
      bg='rgba(77, 77, 77, 0.8)'
      direction='column'
      p='xs'
      style={{
        outline: props.selected ? `2px solid ${colorWithAlpha(theme.colors[theme.primaryColor][9], 0.6)}` : 'none',
        borderRadius: theme.radius.sm,
        filter: blurred ? 'blur(2px)' : 'none',
      }}
      gap='md'
    >
      <Flex>
        <Text
          size='2vh'
          style={{
            fontFamily:'Akrobat Bold',
          }}
        >{props.label}</Text>
        <DeleteButton job={props.name}/>

      </Flex>
      
      <Flex
        gap='xs'
      >
        <InfoBox label="Rank" value={props.rank_label} icon='star' selected={props.selected}/>
         {settings.jobCounts && (
          <InfoBox label="Active" value={props.active} icon='clock' selected={props.selected}/>
         )}
        <InfoBox label="Salary" value={props.salary} icon='money-bill' selected={props.selected}/>
      </Flex>


      <Flex
        justify='space-between'
        gap='md'
      >
        <Button 
          hoverColor={props.duty ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.5)'}
          disabled={blurred || !props.selected}
          onClick={() => {
            if (blurred) return
            funcs.setDuty(props.name, !props.duty);
          }} 
          flex={1}
          size='md'
        >Toggle Duty {props.duty ? 'Off' : 'On'}
        </Button>
        <Button 
          hoverColor={props.selected ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.5)'}
          disabled={blurred}
          onClick={() => {
            if (blurred) return
            if (props.selected) {
              funcs.setSelectedJob(settings.unemployedJob);
              return
            }
            funcs.setSelectedJob(props.name);
          }}
          flex={1}
          size='md'
        >{props.selected ? 'Deselect' : 'Select'}</Button>
      </Flex>
    </Flex>
  )
}

export default JobCard;