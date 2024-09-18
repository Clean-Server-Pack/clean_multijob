import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Tooltip, useMantineTheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";

type HoverIconProps = {
  selected?: boolean,
  style?: React.CSSProperties,
  icon: string,
  color?: string,
  onClick: () => void
  fontSize?: string

  disableTip?: boolean
  tooltip?: string
}

function HoverIcon(props: HoverIconProps) {
  const {hovered, ref} = useHover();
  const theme = useMantineTheme();
  return (
    <Tooltip 

      position="left"
      offset={20}
      style={{
        fontSize: '2vh',
        color: 'white',
      }}
      bg='rgba(0,0,0,0.8)'
      disabled={!props.tooltip || props.disableTip} 
      label={props.tooltip}>

      <Box
        ref={ref}
        bg={props.selected || hovered ? 'rgba(255,255,255,0.2)' : 'rgba(77,77,77,0.8)'}
        p='xs'
        style={{
          borderRadius: 'var(--mantine-radius-sm)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all ease-in-out 0.2s',
          fontSize: props.fontSize || '1rem',
          ...props.style
        }}
        onClick={props.onClick}
      >
        <FontAwesomeIcon icon={props.icon as IconProp} size='sm' color={props.selected || hovered ? theme.colors[theme.primaryColor][9] : props.color} />
      </Box> 
    </Tooltip>
  )
}

export default HoverIcon;