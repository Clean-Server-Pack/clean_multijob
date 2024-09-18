import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Flex, Text, useMantineTheme } from "@mantine/core";
import colorWithAlpha from "../../utils/colorWithAlpha";

type InfoBoxProps = {
  label: string,
  value: string | number,
  icon: string, 
  selected: boolean,
}

function InfoBox({label, value, icon, selected}: InfoBoxProps) {
  const theme = useMantineTheme();
  return (
    <Box
      flex={0.33}
      p='md'
      bg={'rgba(55,55,55,0.6)'}
      style={{
        border: selected ? `2px solid ${colorWithAlpha(theme.colors[theme.primaryColor][9], 0.6)}` : '2px solid rgba(55,55,55,0.6)',
        borderRadius: 'var(--mantine-radius-sm)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontAwesomeIcon 
        style={{
          fontSize: '2vh',
        }}
        icon={icon as IconProp}      
        color='white' 
      />
      <Flex
        w='100%'
        direction='column'
        justify='center'
        align='center'
        p='xs'
      >
        <Text
          c='lightgrey'
          style={{
            fontSize: '2vh',
          }}
        >{label}</Text>
        <Text 
          style={{
            fontSize: '1.8vh',
            textWrap: 'pretty',
          }}
        >{value}</Text>
      </Flex>

    </Box>
  )
}

export default InfoBox;