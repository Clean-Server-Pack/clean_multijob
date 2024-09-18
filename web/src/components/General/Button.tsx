import { Flex, Text, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"

type ButtonProps = { 
  hoverColor?: string,
  flex?: number,
  onClick?: () => void,
  style?: React.CSSProperties
  disabled?: boolean
  children?: React.ReactNode

  size?: string
}

export default function Button(props:ButtonProps) {
  const theme = useMantineTheme();
  const {hovered, ref} = useHover(); 
  return (
    <Flex
      ref={ref} 
      bg={'rgba(44, 44, 44, 0.8)'}
      p='sm'
      flex={props.flex}
      direction={'column'}
      align={'center'}
      style={{
        cursor: 'pointer',
        outline: !props.disabled && hovered ? props.hoverColor? `2px solid ${props.hoverColor}` : `2px solid ${theme.colors[theme.primaryColor][9]}` : '2px solid rgba(44,44,44,0.8)',
        borderRadius: theme.radius.sm,
      }}
      justify='center'
      onClick={() => {
        if (props.disabled) return
        props.onClick && props.onClick()  
      }}
    >
      <Text
       size={props.size || '1.8vh'}
       style={{
        fontSize: props.size || '1.8vh'
       }}
      >
        {props.children}
      </Text>
    </Flex>
  )
}