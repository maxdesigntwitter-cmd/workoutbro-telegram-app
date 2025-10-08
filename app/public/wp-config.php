<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'No{^U&91VoCU6HcOuOp*&jV+@{<K`mZ@Hj`HAWP<%V6-+A`IpqNGAQfHl!N<8;(c' );
define( 'SECURE_AUTH_KEY',   '0)x@<lfP~$[b L/mD]*lc>4N!#Gj<51Fa:uWe,THgr=-c{0F<mnu?rg^Vuf%}G{5' );
define( 'LOGGED_IN_KEY',     'aw;F9nTC/doCkni0K~GoO%^f2sa[NPU-WShpXjJdFhI55E~Bh8sO}{;m+^0eFm#C' );
define( 'NONCE_KEY',         'V*4dpmmErijHbo,F0D0&H+m`{oX^ pkOF[%aw*L XL_B2#5&qRp^F/n/75`#bT- ' );
define( 'AUTH_SALT',         'bAq>w2-fP+dt P -UOH[]_TLf=A[-p=eqYP*Kg0HW*+eshU1o>jA_-E|]#9WU%U<' );
define( 'SECURE_AUTH_SALT',  'x(paKs L,T?tvsr3SGlCH:/}(JwwSR7@R:U`w3irK`mUwlJ$8/UH^AZ_^2hlv4$q' );
define( 'LOGGED_IN_SALT',    ':-kJ{HRKVxZn{!f9zQ0C>!<G*g@wL_k^d3}d3fO0D Lm6{9`^gN]6}9WHO<@PN#$' );
define( 'NONCE_SALT',        ' GJGYU(IG@uRW$.hRxo N##BrxMY{ILgASnu1s2iezAHHV<$v3%nX27(n]q}?N]G' );
define( 'WP_CACHE_KEY_SALT', '{-hK^R]R]]8X|uwyGwpYX%lHN@izCA(i;Ys!^Y]*Pz&`17j}4I.tJx]dkrLPGqds' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
