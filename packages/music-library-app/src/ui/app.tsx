import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import styles from "./app.module.scss";

export default function () {
    return <div className={classNames(Classes.DARK, styles.app)}>Music Library App</div>;
}
