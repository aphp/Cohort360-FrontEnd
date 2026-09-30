import React from 'react'
import { Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

import useStyles from './styles'
import ItemIcon from './ItemIcon'
import NestedLink from './NestedLink'
import { type MenuChild, type MenuItem } from './useMenuItems'
import ShimmerBadge from 'components/ui/ShimmerBadge'

const externalLinkProps = ({ href }: MenuChild) => (href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})

const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) =>
  expanded ? <ExpandLess color="action" /> : <ExpandMore color="action" />

type MenuEntryProps = {
  item: MenuItem
  open: boolean
  expanded: boolean
  onToggle: () => void
}

const MenuEntry: React.FC<MenuEntryProps> = ({ item, open, expanded, onToggle }) => {
  const { classes, cx } = useStyles()
  const { id, label, icon, highlighted, href, onClick, children } = item

  const header = (
    <>
      <ItemIcon title={label} open={open}>
        {icon}
      </ItemIcon>

      <ListItemText className={classes.title} primary={highlighted ? <ShimmerBadge>{label}</ShimmerBadge> : label} />
    </>
  )

  if (href) {
    return (
      <ListItem id={id} className={classes.listItem} component="a" {...externalLinkProps(item)}>
        {header}
      </ListItem>
    )
  }

  if (!children) {
    return (
      <ListItemButton id={id} className={classes.listItem} onClick={onClick}>
        {header}
      </ListItemButton>
    )
  }

  return (
    <>
      <ListItemButton id={id} className={classes.listItem} onClick={onToggle}>
        {header}
        <ExpandIcon expanded={expanded} />
      </ListItemButton>

      <Collapse
        className={cx(classes.nestedList, { [classes.hide]: !open })}
        in={expanded}
        timeout="auto"
        unmountOnExit
      >
        <List id={`${id}-collapse`}>
          {children.map((child) => (
            <NestedLink key={child.id} id={child.id} onClick={child.onClick} {...externalLinkProps(child)}>
              {child.label}
            </NestedLink>
          ))}
        </List>
      </Collapse>
    </>
  )
}

export default MenuEntry
